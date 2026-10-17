# MX-03: Banco de México UDI data and reuse

Retrieved and reviewed: 2026-10-17 (America/Mexico_City).

* Official series: SP68257, “Valor de UDIS”, Banco de México SIE. Public source for attribution:
  https://www.banxico.org.mx/SieInternet/consultarDirectorioInternetAction.do?accion=consultarCuadro&idCuadro=CP150&locale=es&sector=8
* The API's dated-range endpoint, not its latest-value endpoint, is
  `https://www.banxico.org.mx/SieAPIRest/service/v1/series/SP68257/datos/{start}/{end}`.
  See https://www.banxico.org.mx/SieAPIRest/service/v1/doc/consultaDatosSerieRango .
  That endpoint documents a limit of 200 requests per five minutes and 10,000
  per calendar day. This project requests approximately one range per year and
  retries rate limiting only a bounded number of times.
* Banxico's general terms authorize reproduction/use of published information
  with attribution to the source and Banxico's internet address:
  https://www.banxico.org.mx/salvedad/salvedad.html . Recheck these terms before
  launching; if a more specific restriction prohibits storage or republication
  of this series, do not deploy the UDI pages without authorization.
* Banxico's publication procedure specifies that UDI values for the 11th–25th
  are released by the 10th and those for the 26th–next 10th by the 25th:
  https://www.banxico.org.mx/marco-normativo/marco-juridico/unidades-de-inversion/%7B3F494B65-C242-20DA-A8E3-47FEBBF94C9D%7D.pdf .
  The series starts on 1995-04-04; values beyond the current day may already be
  published, but are never displayed as today's rate before their dated day.

The raw snapshots are **unmodified response bodies**; only the first retrieval
is committed. Later Vercel builds write timestamped snapshots to their ephemeral
build filesystem and publish the retrieval timestamp with the derived data.
Neither the API token nor its request headers are saved. Permanent retention
of every daily snapshot would require separate owner-approved storage.
