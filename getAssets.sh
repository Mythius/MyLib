rm -rf site/assets
mkdir site/assets
gdrive files list --parent $1 --max 500 --skip-header --field-separator , | cut -d , -f 1 | xargs -I{} gdrive files download {} --destination site/assets
