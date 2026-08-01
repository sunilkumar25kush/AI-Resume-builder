#!/bin/bash
# M3 backend smoke test — notifications + profile + avatar
B=http://localhost:5001/api
J="Content-Type: application/json"
CK=/tmp/ck3.txt
OUT=/tmp/m3test
mkdir -p "$OUT"
rm -f "$CK"

echo "== REGISTER =="
curl -s -c "$CK" -H "$J" -d '{"name":"M3 Tester","email":"m3@test.com","password":"password123"}' "$B/auth/register" -o "$OUT/reg.json"
grep -o '"success":[a-z]*' "$OUT/reg.json"

echo "== NOTIFICATIONS LIST =="
curl -s -b "$CK" "$B/notifications" -o "$OUT/notif.json"
grep -o '"title":"[^"]*"' "$OUT/notif.json" | head -1
grep -o '"total":[0-9]*' "$OUT/notif.json" | head -1

NID=$(sed -n 's/.*"_id":"\([a-f0-9]*\)".*/\1/p' "$OUT/notif.json" | head -1)
echo "first notif id: ${NID:0:10}..."

echo "== MARK READ =="
curl -s -b "$CK" -X PATCH "$B/notifications/$NID/read" -o "$OUT/read.json"
grep -o '"success":[a-z]*' "$OUT/read.json"

echo "== READ-ALL =="
curl -s -b "$CK" -X PATCH "$B/notifications/read-all" -o "$OUT/readall.json"
grep -o '"success":[a-z]*' "$OUT/readall.json"

echo "== UPDATE PROFILE =="
curl -s -b "$CK" -X PATCH -H "$J" -d '{"name":"M3 Tester Updated"}' "$B/users/me" -o "$OUT/prof.json"
grep -o '"name":"[^"]*"' "$OUT/prof.json"

echo "== BAD NAME (400 expected) =="
curl -s -b "$CK" -X PATCH -H "$J" -d '{"name":"a"}' -o "$OUT/bad.json" -w "HTTP %{http_code}\n"
grep -o '"message":"[^"]*"' "$OUT/bad.json" | head -1

echo "== NO AUTH (401 expected) =="
curl -s -X PATCH -H "$J" -d '{"name":"No Auth"}' -o /dev/null -w "HTTP %{http_code}\n" "$B/users/me"

echo "== AVATAR UPLOAD =="
# 1x1 red PNG
printf '\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\xf8\xcf\xc0\x00\x00\x00\x03\x00\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00' > "$OUT/pixel.png"
curl -s -b "$CK" -X PATCH -F "avatar=@$OUT/pixel.png;type=image/png" "$B/users/me/avatar" -o "$OUT/avatar.json"
AV=$(sed -n 's/.*"avatar":"\([^"]*\)".*/\1/p' "$OUT/avatar.json")
echo "avatar path: $AV"
curl -s -o /dev/null -w "GET avatar HTTP %{http_code}\n" "http://localhost:5001$AV"

echo "== BAD FILE (text as image -> 400 expected) =="
echo "not an image" > "$OUT/fake.txt"
curl -s -b "$CK" -X PATCH -F "avatar=@$OUT/fake.txt;type=image/png" -o "$OUT/fake.json" -w "HTTP %{http_code}\n"
grep -o '"message":"[^"]*"' "$OUT/fake.json" | head -1
