<table border="1"> <!-- El border="1" es un refuerzo para DomPDF -->
    <thead>
        <tr>
            <th rowspan="2" width="25%">GRADO</th>
            <th rowspan="2" width="5%">S</th>
            <th colspan="{{ count($data['uniqueAges']) }}">EDADES</th>
            <th rowspan="2" width="10%">TOTAL</th>
        </tr>
        <tr>
            @foreach($data['uniqueAges'] as $age)
            <th width="auto">{{ $age }}</th>
            @endforeach
        </tr>
    </thead>
    <tbody>
        @foreach($data['processedReport'] as $grado => $sexos)
        @foreach(['M', 'F'] as $s)
        <tr>
            {{-- Solo mostramos el nombre del grado en la primera fila (M) --}}
            @if($s === 'M')
            <td rowspan="2" class="grado-cell">{{ $grado }}</td>
            @endif

            <td style="font-weight: bold;">{{ $s }}</td>

            @foreach($data['uniqueAges'] as $age)
            <td>{{ $data['processedReport'][$grado][$s][$age] ?? 0 }}</td>
            @endforeach

            <td class="total-row">
                {{ $data['processedReport'][$grado][$s]['total_fila'] }}
            </td>
        </tr>
        @endforeach
        @endforeach
    </tbody>
    <tfoot>
        <tr class="total-row">
            <td colspan="2">TOTAL GENERAL</td>
            @foreach($data['uniqueAges'] as $age)
            <td>{{ $data['reportTotals']['totalByAgeColumn'][$age] ?? 0 }}</td>
            @endforeach
            <td style="background-color: #ddd;">
                {{ $data['reportTotals']['grandTotal'] }}
            </td>
        </tr>
    </tfoot>
</table>