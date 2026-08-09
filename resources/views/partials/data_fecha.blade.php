 <style>
     .data-fecha {
         text-align: center;
         margin-top: 70px;
         font-size: 1.0rem;

     }
 </style>

 <div class="data-fecha">Constancia que se expide en

     @if ($dia == 01)
     Tucupita al primer <b><u> {{ $dia }} </b></u> día del mes de
     <b><u>{{ ucfirst($mes) }}</b></u> del año <b><u> {{ $aho }} </b></u>
     @endif
     @if ($dia != 01)
     Tucupita a los <b><u> {{ $dia }} </b></u> dias del mes de
     <b><u>{{ ucfirst($mes) }}</b></u>
     del año <b><u> {{ $aho }} </b></u>
     @endif
 </div>