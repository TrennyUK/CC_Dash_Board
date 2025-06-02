#!/bin/bash
while true; do
  git add .
  git commit -m "auto update"
  git push
  sleep 120  # lặp lại mỗi 60 giây
done
