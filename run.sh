cd /thevillage/
rm build/templates/ -R
cp src/templates/ build/ -R
#node --require ts-node/register src/index.ts
node build/index.js
