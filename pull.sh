#!/bin/bash
git reset --hard
git pull origin main
pm2 restart questionnaire

