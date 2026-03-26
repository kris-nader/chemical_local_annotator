# chembl-local-annotator

Offline ChEMBL annotation pipeline for large compound libraries. Processes 700,000+ InChIKeys in **minutes** by querying a local ChEMBL SQLite database - compared to months using the public REST API.

## Overview

This pipeline cross-references a large compound library (tested on the [SPECS](https://www.specs.net/) collection, ~715k compounds) against the [ChEMBL](https://www.ebi.ac.uk/chembl/) database to extract high-confidence pharmacological annotations. It produces 6 output files that mirror the output of the [chemical_annotator](https://github.com/FlavioBallante/chemical_annotator) Python tool, but entirely offline.

## Output Files

| File | Contents |
|------|----------|
| `*_drugs_assay.csv` | High-confidence bioassay hits per compound |
| `*_drugs_info.csv` | Drug properties, synonyms, and clinical indications |
| `*_drugs_moa.csv` | Mechanisms of action and action types |
| `*_targets_info.csv` | Target proteins with UniProt accessions |
| `*_drugs_assay_targets_info.csv` | Full merged assay + target + protein hierarchy table |
| `*_pathway_info.csv` | KEGG pathway data *(bypassed — requires paid KEGG FTP access)* |

Default filters applied: **Confidence Score ≥ 8** (single protein targets only) and **pChEMBL ≥ 6.0** (IC50/Ki ≤ 1 µM).

## Requirements

- R ≥ 4.0
- R packages: `DBI`, `RSQLite`, `dplyr`, `data.table`
- ChEMBL SQLite database (~5 GB compressed, ~30 GB uncompressed)

## Setup

### 1. Download the ChEMBL SQLite Database

```bash
# Download from the EBI FTP server (replace 36 with the latest version)
wget https://ftp.ebi.ac.uk/pub/databases/chembl/ChEMBLdb/latest/chembl_36_sqlite.tar.gz

# Extract
tar -zxvf chembl_36_sqlite.tar.gz
```

### 2. Install R dependencies

```r
install.packages(c("DBI", "RSQLite", "dplyr", "data.table"))
```

### 3. Prepare your input file

Your input CSV must contain a column named `INCHIKEY`. Example:

```
NAME,SMILES,INCHIKEY
Compound_1,CC(=O)Oc1ccccc1C(=O)O,BSYNRYMUTXBXSQ-UHFFFAOYSA-N
```

### 4. Configure and run

Open `scripts/12_chembl_local_expanded.R` and update the paths at the top:

```r
chembl_db_path <- "/path/to/chembl_36.db"
specs_csv_path <- "/path/to/your_compounds.csv"
output_dir     <- "/path/to/output_folder"
```

Then run:

```bash
Rscript scripts/12_chembl_local_expanded.R
```

## Performance

| Method | 715k compounds |
|--------|---------------|
| ChEMBL REST API (web) | ~8 months |
| This pipeline (local SQLite) | ~5 minutes |

## Why not use the REST API?

The public ChEMBL and PubChem APIs enforce strict rate limits (5 requests/second for PubChem). For datasets with hundreds of thousands of compounds, sequential API queries are not feasible. Downloading the ChEMBL database locally and querying it via SQL eliminates all network latency and rate limiting.

## Citation

If you use ChEMBL data, please cite:

> Mendez D, et al. ChEMBL: towards direct deposition of bioassay data. *Nucleic Acids Research*, 2019. https://doi.org/10.1093/nar/gky1075

If you use this tool, please cite:
>Reinshagen J, et al. From Library to Landscape: Integrative Annotation Workflows for Compound Libraries in Drug Repurposing. Database, 2025. https://doi.org/10.1093/database/baaf081
