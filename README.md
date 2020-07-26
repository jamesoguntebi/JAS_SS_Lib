# SpreadSheet Library for James's Apps Script projects

## Quick start

In the client script:

1. Add this library in appscript.json

`userSymbol` is important. It must match the import name later in TS files. See step 4.

```
{
  "dependencies": {
    "libraries": [{
      "userSymbol": "SSLib",
      "libraryId": "1aTGsRDaXIHXpmR9yUhop_JN-fE0FS0E7x2bMKOtR9HFO-mVdIHBytALE",
      "version": "1",
      "developmentMode": true
    }]
    ...
  },
}

```

2. Copy `ss_lib.d.ts` from this project to the root directory of the client script.

3. Add a `global.d.ts` with the path reference:

```
/// <reference path="./ss_lib.d.ts" />
```

4. In any TS file, import symbols from JASLib:

```
import { SSLib } from "ss_api"

export class SomeTest implements JASLib.Test {
  ...
```

## Updates

```
$ rm jas_lib.* && tsc
$ clasp version
```

1. All client scripts need to either update to the latest library version or have development mode on.

2. Client script codebases need to copy in the latest `jas_lib.d.ts` for type declarations.