<?php

namespace App\Controllers;

use App\Models\MunicipiosModel;
use CodeIgniter\API\ResponseTrait;

class MunicipiosController extends BaseController
{
    use ResponseTrait;

    public function index()
    {
        $provinceId = $this->request->getGet('id_provincia');
        $model = new MunicipiosModel();
        $rows = $model->listByProvince($provinceId ? (int) $provinceId : null);
        return $this->respond(['municipios' => $rows]);
    }
}


