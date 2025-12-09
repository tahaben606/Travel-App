<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;  // Add this trait

class Client extends Authenticatable
{
    use HasFactory, HasApiTokens, Notifiable;  // Include HasApiTokens

    protected $table = 'clients';
    protected $primaryKey = 'id_client';
    public $timestamps = false;
    
    protected $fillable = [
        'nom',
        'email',
        'mot_de_passe',
    ];
    
    protected $hidden = [
        'mot_de_passe',
        'remember_token',
    ];
    
    protected $casts = [
        'date_inscription' => 'datetime',
    ];
    
    public function getAuthPassword()
    {
        return $this->mot_de_passe;
    }
}