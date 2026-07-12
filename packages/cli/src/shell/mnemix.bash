# .mnemix/mnemix.bash
# Source this file from .bashrc via: source ~/.mnemix/mnemix.bash

_mnemix_last_command=""
_mnemix_preexec_done=0

_mnemix_preexec() {
  # Skip internal shell functions and prompt machinery
  case "$BASH_COMMAND" in
    _mnemix_*|__vsc_*|precmd*|PROMPT_COMMAND*) return ;;
  esac
  _mnemix_last_command="$BASH_COMMAND"
  _mnemix_preexec_done=1
}
trap '_mnemix_preexec' DEBUG

_mnemix_precmd() {
  local exit_code=$?
  # Only act when preexec actually recorded a real user command
  if [[ $_mnemix_preexec_done -eq 0 || -z "$_mnemix_last_command" ]]; then
    _mnemix_preexec_done=0
    return
  fi
  # Skip if the recorded command is itself an internal function
  case "$_mnemix_last_command" in
    _mnemix_*|__vsc_*) _mnemix_preexec_done=0; return ;;
  esac
  _mnemix_preexec_done=0
  if [[ $exit_code -ne 0 ]]; then
    mnemix capture \
      --command "$_mnemix_last_command" \
      --exit-code "$exit_code" \
      --directory "$PWD" \
      --git-branch "$(git rev-parse --abbrev-ref HEAD 2>/dev/null)"
  else
    mnemix resolve \
      --command "$_mnemix_last_command" \
      --directory "$PWD" \
      --git-branch "$(git rev-parse --abbrev-ref HEAD 2>/dev/null)" 2>/dev/null
  fi
}
PROMPT_COMMAND="_mnemix_precmd${PROMPT_COMMAND:+; $PROMPT_COMMAND}"
