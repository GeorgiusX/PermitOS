#!/usr/bin/env bash
#
# memwatch.sh — lightweight macOS memory/swap logger for catching spikes.
#
# Samples every few seconds. Logs a compact one-liner while things are calm,
# and a DETAILED top-process dump the moment memory pressure rises — so the
# tail of the log shows exactly which process ran away before a crash.
#
# Usage:
#   bash scripts/memwatch.sh                 # logs to ./memwatch.log every 5s
#   INTERVAL=3 FREE_ALERT=25 bash scripts/memwatch.sh
#
# Stop with Ctrl+C. Review with:  tail -n 60 memwatch.log
#
set -u

INTERVAL="${INTERVAL:-5}"          # seconds between samples
FREE_ALERT="${FREE_ALERT:-20}"     # dump detail when free memory % drops below this
SWAP_ALERT="${SWAP_ALERT:-100}"    # ...or when swap used (MB) exceeds this
LOG="${1:-memwatch.log}"

echo "memwatch → $LOG  (interval ${INTERVAL}s, alert at <${FREE_ALERT}% free or >${SWAP_ALERT}MB swap)"
echo "Leave this running in a Terminal. Ctrl+C to stop."

{
  echo ""
  echo "==================== memwatch started $(date '+%Y-%m-%d %H:%M:%S') ===================="
  echo "physical RAM: $(sysctl -n hw.memsize | awk '{printf "%.0f GB", $1/1073741824}')"
} >> "$LOG"

while true; do
  ts="$(date '+%H:%M:%S')"

  # free memory percentage
  free_pct="$(memory_pressure 2>/dev/null | awk -F': ' '/free percentage/{gsub(/%/,"",$2); print $2}')"
  [ -z "${free_pct:-}" ] && free_pct="?"

  # swap used (MB)
  swap_used="$(sysctl -n vm.swapusage 2>/dev/null | awk '{for(i=1;i<=NF;i++) if($i=="used"){gsub(/M/,"",$(i+2)); print $(i+2)}}')"
  [ -z "${swap_used:-}" ] && swap_used=0

  # top 3 processes (compact, basename only)
  top3="$(ps aux | sort -nrk 4 | head -3 | awk '{n=split($11,a,"/"); printf "%dMB %s; ", $6/1024, a[n]}')"

  echo "$ts | free ${free_pct}% | swap ${swap_used}MB | $top3" >> "$LOG"

  # pressure? dump detail
  alert=0
  case "$free_pct" in
    ''|*[!0-9.]*) : ;;
    *) awk "BEGIN{exit !($free_pct < $FREE_ALERT)}" && alert=1 ;;
  esac
  awk "BEGIN{exit !($swap_used > $SWAP_ALERT)}" && alert=1

  if [ "$alert" -eq 1 ]; then
    {
      echo "  ---- !! PRESSURE at $ts (free ${free_pct}%, swap ${swap_used}MB) — top 12 by RSS ----"
      ps aux | sort -nrk 4 | head -12 | awk '{printf "     %6dMB  %s %s\n", $6/1024, $11, $12}'
    } >> "$LOG"
  fi

  sleep "$INTERVAL"
done
