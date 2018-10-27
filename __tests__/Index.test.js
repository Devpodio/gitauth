const gitAuth = require('../index.js');
const errs = {
  missing: '[GitAuth] Missing username and/or password',
  already: '[GitAuth] Already logged in'
};
describe('GitAuth login method', () => {
  it('should throw if missing username', () => {
    expect.assertions(1);
    return gitAuth.login().catch(e => {
      expect(e.message).toMatch(errs.missing);
    });
  });
  it('should throw if missing password', () => {
    expect.assertions(1);
    return gitAuth.login('user').catch(e => {
      expect(e.message).toMatch(errs.missing);
    });
  });
});