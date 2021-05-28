# ChangeBeadsThreader
<div align="center">
  <img src="resource/cbt-icon.png?raw=true" width="120" height="120" alt=""/>
</div>

_ChangeBeadsThreader_ is an interactive environment for supporting the manual tailoring of automatically untangled changes.

## Demo
[![](https://img.youtube.com/vi/q4kNcvjpxvo/0.jpg)](https://www.youtube.com/watch?v=q4kNcvjpxvo)

## Requirements
- Git
  - The `$PATH` environment variable should be configured to execute the command as `git`
- Java 1.8+
- node.js
- yarn

## Installation
1. `$ git clone https://github.com/salab/ChangeBeadsThreader.git`
1. `$ yarn`
1. `$ yarn build`

## Usage
1. `$ yarn start`
1. Click `Open repository button` and select a file
    - The file is a JSON file produced by [ChangeBeadsPreprocessor](https://github.com/salab/ChangeBeadsPreprocessor)
    - The repository directory and the JSON file must have the same name and be in the same directory
    ##### Example of the file placement
    ```
    ┣━example.json
    ┗━example
        ┠━.git
        ┗━FileExample.java
    ```
1. Merge and split clusters (See the demo)
1. Click `Export Repository button` and export the untangled repository

## Related Publication
If you use or mention this tool in a scientific publication, we would appreciate citations to the following paper:

Satoshi Yamashita, Shinpei Hayashi, Motoshi Saeki: "ChangeBeadsThreader: An Interactive Environment for Tailoring Automatically Untangled Changes". In Proceedings of the 27th IEEE International Conference on Software Analysis, Evolution and Reengineering (SANER 2020), pp. 657-661, 2020. DOI: https://doi.org/10.1109/SANER48275.2020.9054861 / Preprint: https://arxiv.org/abs/2003.14086
```
@inproceedings{yamashita-saner2020,
    author = {Satoshi Yamashita and Shinpei Hayashi and Motoshi Saeki},
    title = {{ChangeBeadsThreader}: An Interactive Environment for Tailoring Automatically Untangled Changes},
    booktitle = {Proceedings of the 27th IEEE International Conference on Software Analysis, Evolution and Reengineering (SANER 2020)},
    pages = {657--661},
    year = 2020,
    doi = {10.1109/SANER48275.2020.9054861}
}
```
