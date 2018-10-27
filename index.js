const ghGot = require('gh-got');

exports.login = async (username, password, otp) => {
  let headers = {
    'accept': 'application/json',
    'User-Agent': 'GitPodCe v1.0'
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
}