import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';
import { ApkSigner, SigningKey } from 'apk_sign_ts';

function adler32(buf, start) {
  let a = 1, b = 0;
  for (let i = start; i < buf.length; i++) {
    a = (a + buf[i]) % 65521;
    b = (b + a) % 65521;
  }
  return (b << 16) | a;
}

async function updateAndSignApk() {
  console.log('1. Building production frontend assets...');
  execSync('npm run build', { stdio: 'inherit' });

  const workDir = '/tmp/apk_repack_work';
  const unsignedApkPath = '/tmp/repack_unsigned.apk';
  const finalApkPath = path.resolve('public/ConcreteMixDesignPro.apk');

  console.log('2. Unpacking base APK...');
  execSync(`rm -rf ${workDir} && mkdir -p ${workDir}`);
  execSync(`unzip -q ${finalApkPath} -d ${workDir}`);

  console.log('3. Cleaning old signatures & outdated assets...');
  execSync(`rm -rf ${workDir}/META-INF`);
  execSync(`rm -rf ${workDir}/assets/www/*`);

  console.log('4. Copying fresh dist/ bundle into assets/www/...');
  execSync(`cp -r dist/* ${workDir}/assets/www/`);

  // Strip crossorigin attribute from assets/www/index.html to ensure file:// protocol compatibility
  const htmlPath = path.join(workDir, 'assets/www/index.html');
  if (fs.existsSync(htmlPath)) {
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');
    htmlContent = htmlContent.replace(/\s*crossorigin(?:="[^"]*")?/g, '');
    htmlContent = htmlContent.replace(/src="\/assets\//g, 'src="./assets/');
    htmlContent = htmlContent.replace(/href="\/assets\//g, 'href="./assets/');
    htmlContent = htmlContent.replace(/href="\//g, 'href="./');
    
    // Inject a robust script error visualizer so on mobile any runtime issue is clearly visible
    const errorReporter = `
    <script>
      window.addEventListener('error', function(e) {
        console.error('Mobile Web Error:', e);
        var errBox = document.getElementById('runtime-error-box');
        if (!errBox) {
          errBox = document.createElement('div');
          errBox.id = 'runtime-error-box';
          errBox.style = 'position:fixed;bottom:10px;left:10px;right:10px;background:#7f1d1d;color:#fecaca;padding:12px;border-radius:8px;font-size:11px;z-index:99999;word-break:break-all;border:1px solid #ef4444;';
          document.body.appendChild(errBox);
        }
        errBox.innerHTML = '<strong>App Error:</strong> ' + (e.message || e) + '<br><small>' + (e.filename || '') + ':' + (e.lineno || '') + '</small>';
      });
    </script>
    `;
    htmlContent = htmlContent.replace('</body>', `${errorReporter}</body>`);
    fs.writeFileSync(htmlPath, htmlContent);
    console.log('   assets/www/index.html patched with relative paths & error reporter.');
  }

  console.log('5. Patching classes.dex to load local assets offline (bypassing auth-protected URLs)...');
  const dexPath = path.join(workDir, 'classes.dex');
  let dex = fs.readFileSync(dexPath);
  
  // In MainActivity:
  // Offset 2372 is: 1a00 5f00 6e20 1c00 0200 (const-string v0, 0x5f; invoke-virtual {v2, v0}, WebView.loadUrl)
  // String 0x5f is the external https:// URL that redirects to auth check.
  // String 0x57 is "file:///android_asset/www/index.html".
  // Changing 5f00 to 5700 forces the WebView to always load the offline bundled asset directly!
  if (dex[2372] === 0x1a && dex[2374] === 0x5f && dex[2375] === 0x00) {
    dex[2374] = 0x57;
    dex[2375] = 0x00;
    console.log('   Patched instruction at offset 2372 from string@5f to string@57 (file:///android_asset/www/index.html).');
  } else if (dex[2372] === 0x1a && dex[2374] === 0x57) {
    console.log('   Instruction at offset 2372 is already string@57.');
  }

  // Recalculate SHA1 (offset 12..32) of rest of DEX (offset 32..)
  const newSha1 = crypto.createHash('sha1').update(dex.slice(32)).digest();
  newSha1.copy(dex, 12);

  // Recalculate Adler32 (offset 8..12) of rest of DEX (offset 12..)
  const newAdler = (adler32(dex, 12) >>> 0);
  dex.writeUInt32LE(newAdler, 8);

  fs.writeFileSync(dexPath, dex);
  console.log(`   classes.dex checksums updated: Adler32=${newAdler}, SHA1=${newSha1.toString('hex')}`);

  console.log('6. Packaging unsigned APK via zipfile...');
  if (fs.existsSync(unsignedApkPath)) fs.unlinkSync(unsignedApkPath);
  const zipScript = `import zipfile, os
z = zipfile.ZipFile('${unsignedApkPath}', 'w', zipfile.ZIP_DEFLATED)
for root, _, files in os.walk('${workDir}'):
    for f in files:
        full_path = os.path.join(root, f)
        rel_path = os.path.relpath(full_path, '${workDir}')
        zinfo = zipfile.ZipInfo(rel_path, date_time=(2026, 10, 2, 12, 0, 0))
        zinfo.compress_type = zipfile.ZIP_DEFLATED
        with open(full_path, 'rb') as fp:
            z.writestr(zinfo, fp.read())
z.close()
`;
  fs.writeFileSync('/tmp/zip_script.py', zipScript);
  execSync('python3 /tmp/zip_script.py');

  console.log('7. Generating official RSA key & certificate...');
  const keyPemPath = '/tmp/civil_key.pem';
  const certPemPath = '/tmp/civil_cert.pem';
  
  if (!fs.existsSync(keyPemPath) || !fs.existsSync(certPemPath)) {
    const { privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });
    fs.writeFileSync(keyPemPath, privateKey);
    execSync(`openssl req -x509 -new -key ${keyPemPath} -out ${certPemPath} -days 10000 -subj "/C=IN/ST=Tamil Nadu/L=Chennai/O=CivilMix/OU=Engineering/CN=Concrete Mix Design Pro"`);
  }

  const privateKey = fs.readFileSync(keyPemPath, 'utf8');
  const certificate = fs.readFileSync(certPemPath, 'utf8');

  console.log('8. Signing APK with JAR v1, APK Signature Scheme v2 & v3...');
  const unsignedApkBytes = new Uint8Array(fs.readFileSync(unsignedApkPath));
  const signingKey = SigningKey.fromPEM(privateKey, certificate);
  const signer = new ApkSigner({ signingKey });

  const { signedApk } = await signer.sign(unsignedApkBytes);
  fs.writeFileSync(finalApkPath, Buffer.from(signedApk));
  console.log(`9. Successfully generated signed APK at ${finalApkPath} (${signedApk.length} bytes)`);

  // Verify APK integrity
  const testOutput = execSync(`unzip -t ${finalApkPath} | tail -n 5`).toString();
  console.log('10. Archive Verification:\n' + testOutput);

  // Clean temp files
  execSync(`rm -rf ${workDir} ${unsignedApkPath}`);
  console.log('APK build & signing complete!');
}

updateAndSignApk().catch((err) => {
  console.error('Error updating and signing APK:', err);
  process.exit(1);
});
