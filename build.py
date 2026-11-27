import pathlib
s=pathlib.Path('src/shell.html').read_text()
for k,f in [('/*CSS*/','src/app.css'),('/*PARSER*/','src/parser.js'),('/*KOREAN*/','src/korean.js'),('/*APP*/','src/app.js')]:
    s=s.replace(k,pathlib.Path(f).read_text())
pathlib.Path('index.html').write_text(s)
print(len(s))
