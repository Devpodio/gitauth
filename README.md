## gitauth

Get your github token using oauth2 api

Install - `npm i gitauth -g`

## API

`.login username password otp`
- Calls github api and authenticate your account and saves the token to `.git-credentials` relative to your home folder
- Otp is optional, this is for accounts that has 2fa activated

`.logout username`
- Simply deletes your account from `.git-credentials`
- Delete your token on github if you want it to be disabled permanently

`.verify username`
- Returns true or false if user exists

## CLI

- `gitauth login username password otp`
- `gitauth logout usernam``
- `gitauth verifiy username`

WARNING: This module is specifically made for local and not for production. No encryption of any kind. 