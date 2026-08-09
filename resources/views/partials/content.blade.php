  <style>
      .content {
          text-align: justify;
          line-height: 1.9;
          margin-top: -25px;
          font-size: 1.1rem;
          text-indent: 15px;
          font-family: mono;
          color: black;
          letter-spacing: 1px;
      }

      .content::first-letter {
          margin-left: 20px;
      }
  </style>


  <div class="content">

      Quien suscribe

      @if ($director)
      <b><u>{{ $director->nombre_y_apellido }}</b></u>
      Cédula de identidad <b><u>{{ $director->cedula }}</b></u>
      @else
      __________________________________________________ Cédula de identidad _________________________
      @endif

      en su condición de Director(a) de la <b><u>{{ $institucion->nombre_de_la_institucion }}</b></u>,

      que funciona en la Comunidad de <b><u>{{ $institucion->direccion }}</b></u>,

      Parroquia <b><u>{{ $institucion->parroquia }}</b></u>,

      del Estado <b><u>{{ $institucion->estado }}</b></u>,

      adscrita a la dependencia <b><u>{{ $institucion->zona_educativa }}</b></u>,

      código DEA <b><u>{{ $institucion->codigo_dea }}</b></u>,

      código del plantel <b><u>{{ $institucion->codigo_de_dependencia }} </b></u>,

      {!! $section !!}
  </div>