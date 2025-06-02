<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class UsersTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('users')->delete();
        
         DB::table('users')->insert([
            [
                'name' => 'admin',
                'email' => 'admin@mail.com',
                'password' => Hash::make('admin'),
                'profile_photo' => 'Perfil_Inicial.jpg',
                'default_photo' => true,
                'email_verified_at' => Carbon::now(),
                'is_admin' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'usuario2',
                'email' => 'usuario2@mail.com',
                'password' => Hash::make('usuario2'),
                'profile_photo' => 'Perfil_Inicial.jpg',
                'default_photo' => true,
                'email_verified_at' => Carbon::now(),
                'is_admin' => 0,
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);
    }
}
