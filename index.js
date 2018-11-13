const ghGot = require('gh-got');
const gitconfig = require('gitconfig');
const { URL } = require('url')
const fs = require('fs-extra');
const execa = require('execa');
const path = require('path');
const phin = require('phin');
const gitCredsDir = `${process.env.HOME}/.config/.ghstore/`;

const checkGitEmail = async () => {
  return await gitconfig.get('user.email', { location: 'global' });
};
exports.checkGitEmail = checkGitEmail;
const checkGitName = async () => {
  return await gitconfig.get('user.uname', { location: 'global' });
};
const checkGitId = async () => {
  return await gitconfig.get('user.id', { location: 'global' });
};
exports.login = async (email, password, otp, name, currdir) => {
  await fs.ensureDir(gitCredsDir);
  if (!email || !password || !name) {
    console.error('[GitAuth Error] Missing email, name and/or password');
    return false;
  }
  if (await checkGitEmail() || await checkGitName()) {
    console.error('[GitAuth Error] Credentials already exists.');
    return true;
  }
  const resp = await phin({
    url: 'https://api.devpod.io/login',
    method: 'POST',
    data: { email, password, otp },
    parse: 'json'
  });
  const userInfo = resp.body;
  if (!userInfo.success) {
    console.error(`[GitAuth Error] ${userInfo.message || JSON.stringify(userInfo)}`);
    return false;
  }
  if (userInfo.token) {
    const ghUser = await ghGot('user', {
      headers: {
        'accept': 'application/vnd.github.v3+json',
        'User-Agent': 'DevPod v1.0',
        'Authorization': `Bearer ${userInfo.token}`
      }
    });
    if (ghUser.body.login) {
      await fs.outputFile(path.resolve(gitCredsDir, `gh.${ghUser.body.login}.cred`), `https://${ghUser.body.login}:${userInfo.token}@github.com`);
      gitconfig.set({
        'user.name': name,
        'user.uname': ghUser.body.login,
        'user.email': email,
        'user.id': userInfo.id,
        'credential.helper': path.resolve(currdir,'gitauth')
      }, { location: 'global' });
      console.log('[GitAuth] Successfully authenticated');
      return true;
    } else {
      console.error('[GitAuth Error] Invalid login');
      return false;
    }
  } else {
    console.error('[GitAuth Error] Missing Github access token');
    return false;
  }
};

exports.get = async () => {
  const uname = await checkGitName();
  if (!uname) {
    return false;
  }
  const gitUrl = await fs.readFile(path.resolve(gitCredsDir, `gh.${uname}.cred`))
  const { username, password } = new URL(gitUrl);
  process.stdout.write(
    'username=' + username + '\n' +
    'password=' + password + '\n'
  );

};

exports.logout = async (password, otp) => {
  var [email, uname, id] = await Promise.all([checkGitEmail(), checkGitName(), checkGitId()]);
  if (!uname || !email) {
    console.error('[GitAuth Error] Credentials not found');
    return false;
  }
  if (!password) {
    console.error('[GitAuth Error] Missing password');
    return false;
  }
  let headers = {
    'User-Agent': 'DevPod v1.0',
    'Authorization': `Basic ${Buffer.from(`${email}:${password}`).toString('base64')}`
  };
  if (otp) {
    headers = Object.assign({}, headers, {
      'X-GitHub-OTP': otp
    });
  }
  const { body } = await ghGot(`authorizations/${id}`, {
    method: 'DELETE',
    headers
  });
  if (!body) {
    await gitconfig.unset([
      'user.name',
      'user.uname',
      'user.email',
      'user.id',
      'credential.helper'
    ], { location: 'global' });
    await fs.remove(path.resolve(gitCredsDir, `gh.${uname}.cred`));
    console.log('[GitAuth] Successfully logged out from this system');
  } else {
    console.error('[GitAuth Error]', body);
  }
};