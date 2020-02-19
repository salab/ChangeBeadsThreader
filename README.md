# ChangeBeadsThreader
An interactive environment for tailoring automatically untangled changes

## Description
`ChangeBeadsThreader` is interactive environment for supporting the manual tailoring of automatically untangled changes.

## Demo
[![](https://img.youtube.com/vi/q4kNcvjpxvo/0.jpg)](https://www.youtube.com/watch?v=q4kNcvjpxvo)

## Requirement
- Java 11+

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
