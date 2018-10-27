const ghGot = require('gh-got');
const fs = require('fs');
const debug = require('debug')('gitauth');
const gitCredsDir = `${process.env.HOME}/.git-credentials`;

const checkGitCreds = user => {
  if (!fs.existsSync(gitCredsDir)) {
    return false;
  }
  const readCreds = fs.readFileSync(gitCredsDir, 'utf8');
  const users = readCreds.split('\n').map(i => i.split(':')[0]);
  return users.includes(user);
};

const deleteUser = user => {
  if (!fs.existsSync(gitCredsDir)) {
    return false;
  }
  const readCreds = fs.readFileSync(gitCredsDir, 'utf8').split('\n');
  const credsArr = readCreds.map(i => {
    if (i.split(':')[0] !== user) {
      return i;
    }
  }).filter(Boolean);
  fs.writeFileSync(gitCredsDir, credsArr.join('\n'));
  return true;
};

exports.login = async (username, password, otp) => {
  if (!username || !password) {
    throw new Error('[GitAuth] Missing username and/or password');
  }
  if (checkGitCreds(username)) {
    throw new Error('[GitAuth] Already logged in');
  }
  let headers = {
    'accept': 'application/vnd.github.v3+json',
    'User-Agent': 'GitPodCe v1.0',
    'Authorization': `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`
  };
  if (otp) {
    headers = Object.assign({}, headers, {
      'X-GitHub-OTP': otp
    });
  }
  const { body } = await ghGot('authorizations', {
    json: true,
    headers,
    body: {
      'scopes': ['repo'],
      'note': 'GitpodCe',
      'note_url': 'https://git.unibtc.me',
    }
  });
  debug('body token response %s', body.token);
  if (body.token) {
    fs.appendFile(gitCredsDir, `${username}:${body.token}@https://api.github.com`, (err) => {
      if (err) throw err;
      console.log(`Git token was saved at ${gitCredsDir}`);
    });
  }
};

exports.logout = async (username) => {
  if (!username) {
    throw new Error('[GitAuth] Missing username');
  }
  if (!checkGitCreds(username)) {
    throw new Error('[GitAuth] Username not found');
  }
  console.info('[INFO] This will just clear your username from .git-credentials');
  console.info('[INFO] Go to your github account to permanently remove your token');
  const r = deleteUser(username);
  if (!r) {
    throw new Error('[GitAuth] Error logging out');
  }
  console.info('[INFO] Successfully logged out from this system');
};