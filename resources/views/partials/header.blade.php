<style>
    .header {
        position: relative;
        width: 100%;
        text-align: center;
        min-height: 250px;
    }

    .header .logo-superior {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 50px;
        z-index: 2;
    }

    .header .info-cabezera {
        position: relative;
        margin-top: 60px;
        padding-top: 10px;
        padding-bottom: 10px;
        text-align: center;
        line-height: 1.2;
        z-index: 3;
    }

    .header .info-cabezera p {
        margin: 0;
        padding: 0;
        font-size: 1.1rem;
    }

    .header .escudo-centrado {
        position: absolute;
        top: 15%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 150px;
        height: 150px;
        opacity: 0.25;
        z-index: 1;
    }

    .header h4 {
        /* position: relative; */
        margin-top: 15px;
        text-align: center;
        z-index: 3;
    }
</style>

<div class="header">
    <img src="{{ $logoDocumento }}" alt="imagen" class="logo-superior">
    <div class="info-cabezera">
        <p>Républica Bolivariana de Venezuela</p>
        <p>Ministerio del Poder Popular Para la Educación</p>
        <p>{{ $institucion->nombre_de_la_institucion }}</p>
        <p>Tucupita Edo. Delta Amacuro</p>
    </div>
    <img src="img/escudo.png" alt="escudo" class="escudo-centrado">
    <h4><b style="text-transform: uppercase;"> {!! $section_title !!}</b></h4>
    @if (!empty($section_titles))
    <h4 style="text-transform: uppercase;margin-top: -13px"><b> {!! $section_titles !!}</b></h4>
    @endif

</div>