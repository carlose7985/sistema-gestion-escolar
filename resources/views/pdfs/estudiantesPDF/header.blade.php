{{-- resources/views/PDFS/partials/header.blade.php --}}
<div class="header" style="position: relative; text-align: center; margin-bottom: 20px;">

    <div style="position: absolute; left: 0; top: 3%; transform: translateY(-50%); z-index: -1; opacity: 0.5;">
        <img src="{{ $logoDocumento }}" style="height: 60px; width: 350px;">
    </div>

    <div style="position: absolute; right: 0; top: 3%; transform: translateY(-50%); z-index: -1; opacity: 0.5;">
        <img src="{{ $logoInstitucion }}" style="max-height: 55px; max-width: 70px;">
    </div>

    <div style="position: relative; z-index: 1;">
        <div class="title">
            República Bolivariana de Venezuela<br>
            Ministerio del Poder Popular para la Educación<br>
            <span style="color: #000;">{{ $institucion->first()->nombre_de_la_institucion ?? '' }}</span><br>
            <span style="color: #000;">{{ $institucion->first()->municipio ?? '' }} Edo. {{ $institucion->first()->estado ?? '' }}</span>
        </div>

    </div>
</div>