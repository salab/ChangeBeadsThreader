# ChangeBeadsThreader
<div align="center">
  <img src="attach:resource/cbt-icon.png" width="200" alt="icon"/>
</div>

An interactive environment for tailoring automatically untangled changes

## Description
`ChangeBeadsThreader` is interactive environment for supporting the manual tailoring of automatically untangled changes.

## Demo
[![](https://img.youtube.com/vi/q4kNcvjpxvo/0.jpg)](https://www.youtube.com/watch?v=q4kNcvjpxvo)

## Requirement
- Git
  - It need to be able to call it using `git` commands.
- Java 1.8+
- node.js
- yarn

## Installation
1. `$ git clone https://github.com/salab/ChangeBeadsThreader.git`
1. `$ yarn`
1. `$ yarn build`

## Usage
1. `$ yarn start`
1. Click `Open repository button` and select file.
    - File is a json file output by [ChangeBeadsPreprocessor](https://github.com/salab/ChangeBeadsPreprocessor).
    - Repository directory and JSON file must have the same name and be in the same directory
    ##### Example of file placement
    ```
    ┣━example.json
    ┗━example
        ┠━.git
        ┗━FileExample.java
    ```
1. Merge and split clusters. (See demo)
1. Click `Export Repository button` and export untangled repository.

## Related Publication
If you use this tool in a scientific publication, we would appreciate citations to the following paper:

Satoshi Yamashita, Shinpei Hayashi, Motoshi Saeki: "ChangeBeadsThreader: An Interactive Environment for Tailoring Automatically Untangled Changes". (SANER 2020). London, Canada, feb, 2020.
林 晋平, 有賀 顕, 佐伯 元司: ``reqchecker：IEEE 830の品質特性に基づく日本語要求仕様書の問題点検出ツール'', 電子情報通信学会論文誌, Vol. J101-D, No. 1, pp. 57-67, 2018. https://doi.org/10.14923/transinfj.2017SKP0036
```
@inproceedings{yamashita-saner2020,
    author = {Satoshi Yamashita and Shinpei Hayashi and Motoshi Saeki},
    title = {{ChangeBeadsThreader}: An Interactive Environment for Tailoring Automatically Untangled Changes},
    booktitle = {Proceedings of the 27th IEEE International Conference on Software Analysis, Evolution and Reengineering (SANER 2020)},
    pages = {657--661},
    year = 2020,
}
```
