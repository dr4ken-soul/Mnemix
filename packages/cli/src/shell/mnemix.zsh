# .mnemix/mnemix.zsh
# Source this file from .zshrc via: source ~/.mnemix/mnemix.zsh

_mnemix_last_command=""
_mnemix_last_start=0

preexec() {
  _mnemix_last_command="$1"
  _mnemix_last_start=$SECONDS
}

precmd() {
  local exit_code=$?
  if [[ $exit_code -ne 0 && -n "$_mnemix_last_command" ]]; then
    mnemix capture \
      --command "$_mnemix_last_command" \
      --exit-code "$exit_code" \
      --directory "$PWD" \
      --git-branch "$(git rev-parse --abbrev-ref HEAD 2>/dev/null)"
  elif [[ $exit_code -eq 0 && -n "$_mnemix_last_command" ]]; then
    mnemix resolve \
      --command "$_mnemix_last_command" \
      --directory "$PWD" \
      --git-branch "$(git rev-parse --abbrev-ref HEAD 2>/dev/null)" 2>/dev/null
  fi
}
