# Git Installeren voor Windows

## Snelle Installatie

1. **Download Git:**
   - Ga naar: https://git-scm.com/download/win
   - Download de installer (64-bit Git for Windows Setup)

2. **Installeer Git:**
   - Dubbelklik op de installer
   - Klik "Next" door alle stappen (standaard instellingen zijn prima)
   - Kies "Git from the command line and also from 3rd-party software"
   - Klik "Install"

3. **Herstart PowerShell:**
   - Sluit deze PowerShell
   - Open een nieuwe PowerShell
   - Test of Git werkt:
     ```powershell
     git --version
     ```

4. **Configureer Git (eenmalig):**
   ```powershell
   git config --global user.name "Jouw Naam"
   git config --global user.email "jouw@email.com"
   ```

## Na Installatie

Ga terug naar `STAP_VOOR_STAP_DEPLOY.md` en volg vanaf Stap 2.

