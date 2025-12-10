# Yle – Vieraskieliset varhaiskasvatuksessa

Simple search tool built with **Vite + React** for the Yle coding assignment.

The app lets the user search for a Finnish municipality and see:
- how many children attend early childhood education (varhaiskasvatus)
- how many of them are **vieraskieliset** 
- what percentage of all children in that municipality are vieraskieliset
- comparison with the whole country ("KOKO MAA")

Data source: Statistics Finland (Tilastokeskus), table  
**14jt – Varhaiskasvatukseen osallistuneet vieraskieliset ja ulkomaalaiset lapset alueen ja iän mukaan, 2021–2024**.

Only year **2024** and age group **Yhteensä** are used in this demo.

---

## Tech stack

- [Vite](https://vite.dev/) (React template)
- React + hooks (`useState`, `useEffect`)
- CSV loaded from `public/data.csv`
- Simple manual CSV parsing
- Inline styles using Yle brand colors

---

## Getting started

### 1. Install dependencies

```bash
npm install

