{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = with pkgs; [
    nodejs_22
  ];

  shellHook = ''
    echo "OmniMath Terminal Dev Environment"
    echo "Node: $(node --version)"
    echo "npm: $(npm --version)"
    echo ""
    echo "Run 'npm install' to install dependencies"
    echo "Run 'npm run dev' to start the development server"
  '';
}

