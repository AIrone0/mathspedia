{    pkgs ? import <nixpkgs> { } }:
pkgs.mkShell
{
  nativeBuildInputs = with pkgs; [
    nodejs
    # PHP with required extensions for MediaWiki
    php81
    php81Packages.composer
    # PHP extensions needed by MediaWiki
    php81Extensions.mbstring
    php81Extensions.xml
    php81Extensions.intl
    php81Extensions.curl
    php81Extensions.gd
    php81Extensions.mysqli
    php81Extensions.opcache
    php81Extensions.zip
    php81Extensions.zlib
    # Database
    mariadb
    # Utilities
    wget
    unzip
  ];
  shellHook = ''
    echo "=== Mathspedia MediaWiki Development Environment ==="
    
    # Note: MariaDB should be started manually using ./setup-mediawiki.sh
    # Auto-starting in shellHook can cause issues
    if pgrep -x "mysqld" > /dev/null; then
      echo "MariaDB is running"
    else
      echo "MariaDB not running. Run: ./setup-mediawiki.sh"
    fi
    
    # Check if MediaWiki is downloaded
    if [ ! -d "mediawiki" ]; then
      echo "MediaWiki not found. MediaWiki should already be installed in ./mediawiki"
    else
      echo "MediaWiki found in ./mediawiki"
      echo "To start PHP server: cd mediawiki && php -S localhost:8080"
    fi
    
    #source ./something.shell
    '';
  # COLOR = "blue";
  # PASSWORD = import ./password.nix;  # Uncomment if password.nix exists
}
# nix-shell --command zsh
