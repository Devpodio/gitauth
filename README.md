## gitauth

Get your github token using oauth2 api

## API

`.login username password otp`
- Calls github api and authenticate your account and saves the token to `.git-credentials` relative to your home folder
- Otp is optional, this is for accounts that has 2fa activated

`.logout username`
- Simple deletes your account from `.git-credentials`
- Delete your token on github if you want it to be disabled permanently

## CLI

- `gitauth login username password otp`
- `gitauth logout usernam`

WARNING: This module is specifically made for local and not for production. No encryption of any kind. 