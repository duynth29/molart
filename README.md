# molart — Đông Hồ

**Website: https://duynth29.github.io/molart/**

Real protein structures drawn as Vietnamese **Đông Hồ** folk woodblock prints, in the browser.

<img src="docs/dongho-1tim.png" alt="1TIM rendered as a Đông Hồ woodblock print" width="360">

Đông Hồ village (Bắc Ninh) has printed pictures for Tết for centuries: one carved block per colour,
natural pigments on dó paper coated with điệp (crushed scallop shell), and a black key block pressed last.
This renderer prints the protein the same way:

- **Helices** in đỏ son (laterite red), with comb hatching cut from the edges like the bristles of
  *Lợn nái* or the feathers of *Gà trống*, and the occasional âm dương swirl.
- **Strands** as verdigris (gỉ đồng) leaves with sophora-yellow veins, indigo (chàm) undersides with rice-grain dots.
- **Loops** in vàng hoè (sophora yellow).
- Colour blocks printed slightly out of register with a thick charcoal (than lá tre) key line; pigment
  sits unevenly and the shell coating glints through where the block printed thin.

## Features

- **Coordinates never change.** Every effect lives in display geometry and shaders.
- **Science | Art.** Science mode keeps the ribbon geometry; art mode (opt-in, labelled) swells helices into
  the plump rounded forms of the prints and curls the loops.
- **Local.** Files you open stay in your browser. Fetching by PDB ID is an explicit button and
  goes to files.rcsb.org.
- **Export.** White-background PNG up to 4K; `scripts/dongho_paper.py` lays it onto giấy điệp paper with a printed frame.

## Run

Requires Node 20 or newer.

```sh
npm install
npm run dev        # http://localhost:5173
npm run build      # static site in dist/
```

## Command line

Renders with the same code as the app, in headless Chromium
(`npx playwright-core install chromium`).

```sh
node cli/molart.mjs render public/samples/1TIM.cif --width 2400 --height 2400 --output 1tim.png
python3 scripts/dongho_paper.py 1tim.png 1tim_dongho.png    # needs Pillow and numpy
```

## Credits

- Fork of [molart](https://github.com/martin-steinegger/molart) by Martin Steinegger, which renders the
  same structures in many artist-inspired styles; this fork keeps only the Đông Hồ style.
- molart was inspired by Sergey Ovchinnikov's protein structure visualization in
  [LocalFold](https://github.com/sokrypton/localfold).
- Sample structures in `public/samples/` (1TIM, 3CHY, 1UBQ, 4HHB) are unmodified downloads from
  the [RCSB PDB](https://www.rcsb.org) (CC0 1.0).

## License

MIT, see [LICENSE](LICENSE).
