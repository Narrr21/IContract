![icontract](Logo.png)

# IContract
## Aplikasi manajemen kontrak berbasis A.I.
Aplikasi ini menyediakan berbagai macam fitur seperti pembuatan kontrak, review kontrak, edit kontrak, dan scan kontrak dengan bantuan AI


## Cara menjalankan program
Aplikasi ini merupakan aplikasi berbasis web yang sudah deploy pada [link ini](https://icontract-production.up.railway.app)

Namun apabila ingin menjalankannya secara lokal, dapat melakukan langkah-langkah sebagai berikut:

1. Clone repository github ini

2. cd ke direktori repository github yang sudah di-clone

3. `npm install` untuk install dependency

4. `npx prisma generate` untuk menginisialisasi database

5. `npm run dev` untuk menjalankan aplikasi secara lokal di `localhost:3000`

## Cara menggunakan program
Pengguna perlu login sebagai hr, admin, legal, atau manajemen. Masing-masing akun memiliki perannya masing-masing sebagai berikut:

- hr: Membuat dan enyusun kontrak
- admin: Manajemen akun
- legal: Review kontrak
- manajemen: Melihat keseluruhan kontrak yang ada

Pengguna bisa login menggunakan akun:
```
email:      {peran}@example.com
password:   password123
```
dengan {peran} diganti dengan akun hr/admin/legal/manajemen
1. hr : hanya bisa melihat list of contracts dan buat kontrak dimana ada 2 jenis kontrak dan 2 jenis cara pengisian. hr berhak memilih caranya dan mengisikan sesuai permintaan, selanjutnya disimpan dalam database.<img width="1885" height="874" alt="image" src="https://github.com/user-attachments/assets/0b83c87d-4c97-4725-981b-243839f818ba" />
2. 

|  Pesona5 ||
|:-------:|-|
|Wardatul Khoiroh | 13523001 |
| Angelina Efrina Prahastaputri| 13523060 |
| Sebastian Hung Yansen | 13523070 |
|Nadhif Al Rozin | 13523076 |
| Ni Made Sekar Jelita Parameswari | 18223101
