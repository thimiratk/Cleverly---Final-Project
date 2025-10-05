# TODO: Enforce Login Method Based on Registration

## Tasks
- [x] Modify userLogin controller to check user.provider and reject if 'google'
- [x] Modify googleAuthCallback controller to check user.provider and reject if not 'google' or null
- [ ] Test email/password login for Google-registered users
- [ ] Test Google login for email/password-registered users
