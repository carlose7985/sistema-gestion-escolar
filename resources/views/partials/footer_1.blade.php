   <style>
       #footer {
           margin-top: 50px;
           width: 100%;
           text-align: center;
       }

       #footer table {
           width: 100%;
           margin-left: auto;
           margin-right: auto;
           border-collapse: collapse;
           border: 1px solid black;
           /* Borde alrededor de toda la tabla */
       }

       #footer table td {
           border: 1px solid black;
           /* Borde para todas las celdas internas */
           padding: 5px;
           /* Ajusta el padding general para las celdas */
           width: 80%;
           /* Asegura que ambas columnas tengan el mismo ancho */
           text-align: center;
           /* Por defecto, el texto centrado */
           vertical-align: middle;
           /* Alineación vertical central por defecto */
       }

       /* Primera fila: "POR LA INSTITUCIÓN" y "POR EL CDCE DELTA AMACURO" */
       /* Queremos que tenga más altura y texto en negrita, centrado */
       #footer table tr:first-child td {
           height: 25px;
           /* Altura específica para esta fila */
           font-weight: bold;
           text-transform: uppercase;
           /* Convertir a mayúsculas si no lo están ya en el HTML */
       }

       /* Segunda fila: "DIRECTOR(A)" */
       /* También con buena altura y texto centrado, quizá un poco más pequeño */
       #footer table tr:nth-child(2) td {
           height: 10px;
           text-align: left;
           font-size: 0.9em;
           padding-left: 10px;
       }

       /* Tercera fila: "Nombres y Apellidos:" */
       /* Fondo blanco, texto a la izquierda, bastante altura */
       #footer table tr:nth-child(3) td {
           height: 20px;
           text-align: left;
           font-size: 0.9em;
           padding-left: 10px;
           /* Margen interno a la izquierda para el texto */
       }

       /* Cuarta fila: "Cédula de Identidad:" */
       /* Fondo blanco, texto a la izquierda, bastante altura */
       #footer table tr:nth-child(4) td {
           height: 20px;
           text-align: left;
           font-size: 0.9em;
           padding-left: 10px;
           /* Margen interno a la izquierda para el texto */
       }

       /* Quinta fila: "Firma y Sello" */
       /* Mucha altura, texto centrado horizontal y verticalmente */
       #footer table tr:nth-child(5) td {
           height: 20px;
           /* Mucha altura para la firma y el sello */
           vertical-align: bottom;
           /* Alinea "Firma y Sello" en la parte inferior de la celda */
           padding-bottom: 5px;
           /* Un poco de padding desde abajo */
           font-size: 0.9em;
           /* Ligeramente más pequeño, como en la imagen */
       }

       /* Estilos para el texto de validación debajo de la tabla */
       #footer b {
           margin-top: 10px;
           display: block;
           font-size: 0.9em;
           /* Ligeramente más grande */
       }
   </style>

   <div id="footer">
       <table>
           <thead>
               <tr>
                   <td class="margin-th1">POR LA INSTITUCIÓN</td>
                   <td class="margin-th1">POR EL CDCE ESTADAL</td>
               </tr>

               <tr>
                   <td class="">DIRECTOR(A)</td>
                   <td class="">DIRECTOR(A)</td>
               </tr>

               <tr>
                   <td class="margin-th2">Nombres y Apellidos:
                   </td>
                   <td class="margin-th2">Nombres y Apellidos: </td>
               </tr>
               <tr>
                   <td class="margin-th3">Cédula de Identidad:
                   </td>
                   <td class="margin-th3">Cédula de Identidad: </td>
               </tr>

               <tr>
                   <td class="margin-th4">Firma y Sello</td>
                   <td class="margin-th4">Firma y Sello</td>
               </tr>

           </thead>

       </table>

       <b>VALIDO A NIVEL NACIONAL E INTERNACIONAL</b>

   </div>
