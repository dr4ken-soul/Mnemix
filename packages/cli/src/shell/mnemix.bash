# .mnemix/mnemix.bash
# Source this file from .bashrc via: source ~/.mnemix/mnemix.bash

_mnemix_last_command=""

_mnemix_preexec() {
  _mnemix_last_command="$BASH_COMMAND"
}
trap '_mnemix_preexec' DEBUG

_mnemix_precmd() {
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
PROMPT_COMMAND="_mnemix_precmd${PROMPT_COMMAND:+; $PROMPT_COMMAND}"
