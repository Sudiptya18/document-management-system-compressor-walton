# Document Management System | Compressor, WALTON

Local records desk for the Walton Hi-Tech Compressor plant. Each file is stored under an SOP record number, with a JSON sidecar so it can be found again.

The record number is:

`{Document type}HHcP{Department}{Section}{Subsection}{Line}{Model}{Serial}_{Version}`

`HHcP` is fixed: Headquarter `H`, Hi-Tech `H`, Compressor `cP`. The title is kept in the JSON file and is not part of the file name.

Example: a report (`R`) from R&D (`Rd`), mechanical design (`D` / `D`), crank shaft line (`CS`), Walpha (`W`), serial `0001`, version `000`:

`RHHcPRdDDCSW0001_000.pdf`

## Run

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:4317](http://127.0.0.1:4317).

The app is meant for the plant network. It does not call out to the internet while you use it.

## Connect a server

On Save or Search, choose **Connect to Server** and browse to the folder that should hold the records. That can be a directory on this machine or a mounted network share. The choice is remembered in `data/connections.json`.

Use **+** to add a second folder. When two servers are connected, saving asks which one should receive the file.

Two empty folders are included for a first try:

- `plant-servers/primary`
- `plant-servers/secondary`

## What gets stored

For record `RHHcPRdDDCSW0001_000` and a PDF upload, the folder receives:

- `RHHcPRdDDCSW0001_000.pdf` — the file
- `RHHcPRdDDCSW0001_000.json` — title, SOP fields, concern name, employee ID, date, and the original file name

Saving the same record number again shows: **This file is already saved in your designated location**.

## Search

Search uses the same eleven fields. Blank fields are ignored. Results can be filtered as PDF, image, Word, Excel, or other. View opens a preview. Save downloads the original file.

## Checks

```bash
npm test
```
