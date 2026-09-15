Feature: Consulta y venta de vuelos

  Scenario: Listar solo vuelos con disponibilidad
    Given existe un vuelo de "Buenos Aires" a "Madrid" con disponibilidad 5
    And existe un vuelo de "Buenos Aires" a "Paris" con disponibilidad 0
    When consulto el listado de vuelos
    Then la respuesta no debe incluir el vuelo a "Paris"
    And la respuesta debe incluir el vuelo a "Madrid"

  Scenario: Vender un pasaje decrementa la disponibilidad
    Given existe un vuelo de "Buenos Aires" a "Madrid" con disponibilidad 5
    When compro un pasaje para "Juan Perez" en ese vuelo
    Then la venta debe ser exitosa
    And la disponibilidad del vuelo debe ser 4

  Scenario: Vender un pasaje falla si no hay disponibilidad
    Given existe un vuelo de "Buenos Aires" a "Madrid" con disponibilidad 0
    When compro un pasaje para "Juan Perez" en ese vuelo
    Then la venta debe fallar con error "Vuelo sin disponibilidad o inexistente"
    And la disponibilidad del vuelo debe ser 0
