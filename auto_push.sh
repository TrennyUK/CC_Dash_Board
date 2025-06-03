#!/bin/bash

while true; do
    # Thêm tất cả file mới, sửa hoặc xóa
    git add .

    # Chỉ commit nếu có thay đổi
    if ! git diff --cached --quiet; then
        git commit -m "Auto update at $(date +'%Y-%m-%d %H:%M:%S')"
        git push
        echo "✅ Auto pushed at $(date +'%H:%M:%S')"
    else
        echo "ℹ️  No changes to commit at $(date +'%H:%M:%S')"
    fi

    sleep 120  # Lặp lại mỗi 2 phút
done
