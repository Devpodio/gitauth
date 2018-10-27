const ghGot = require('gh-got');
const fs = require('fs');
const gitCredsDir = `${process.env.HOME}/.git-credentials`;

const checkGitCreds = user => {
  if (!fs.existsSync(gitCredsDir)) {
    return false;
  }
  const readCreds = fs.readFileSync(gitCredsDir, 'utf8');
  const users = readCreds.split('\n').map(i => i.split(':')[0]);
  return users.includes(user);
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
  if (body.token) {
    fs.writeFile(`${process.env.HOME}/.git-credentials`, `${username}:${body.token}@https://api.github.com`, (err) => {
      if (err) throw err;
      console.log('Git token was saved at /home/user/.git-credentials');
    });
  }

};