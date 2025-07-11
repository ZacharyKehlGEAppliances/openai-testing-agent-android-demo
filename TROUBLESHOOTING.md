# Common Installation Issues

## Playwright Dependencies Installation Failure

If you encounter errors with `npx playwright install-deps`, try these solutions:

### Linux/Ubuntu Issues
```bash
# Remove broken PPAs
sudo add-apt-repository --remove ppa:maarten-baert/simplescreenrecorder
sudo add-apt-repository --remove ppa:nilarimogard/webupd8  
sudo add-apt-repository --remove ppa:taylorcholberton/tinyalsa

# Update and retry
sudo apt update
npx playwright install-deps
