Feature: Consulta y venta de vuelos

  Scenario: Listar solo vuelos con disponibilidad
    Given existe un vuelo de "Buenos Aires" a "Madrid" con disponibilidad 5
    And existe un vuelo de "Buenos Aires" a "Paris" con disponibilidad 0
    When consulto el listado de vuelos
    Then la respuesta no debe incluir el vuelo a "Paris"
    And la respuesta debe incluir el vuelo a "Madrid"

 Scenario: Una venta descuenta la disponibilidad de sus dos vuelos
    Given existe un vuelo de "Buenos Aires" a "Madrid" con disponibilidad 5
    And existe un vuelo de "Madrid" a "Buenos Aires" con disponibilidad 3
    When compro un pasaje para "Juan Perez" en los vuelos a "Madrid" y a "Buenos Aires"
    Then la venta debe ser exitosa
    And la disponibilidad del vuelo a "Madrid" debe ser 4
    And la disponibilidad del vuelo a "Buenos Aires" debe ser 2
    And deben existir 1 ventas registradas

  Scenario: Si un vuelo no tiene disponibilidad no se vende ninguno de los dos
    Given existe un vuelo de "Buenos Aires" a "Madrid" con disponibilidad 5
    And existe un vuelo de "Madrid" a "Buenos Aires" con disponibilidad 0
    When compro un pasaje para "Juan Perez" en los vuelos a "Madrid" y a "Buenos Aires"
    Then la venta debe fallar con estado 409
    And la disponibilidad del vuelo a "Madrid" debe ser 5
    And la disponibilidad del vuelo a "Buenos Aires" debe ser 0
    And deben existir 0 ventas registradas

  Scenario: Si un vuelo no existe no se vende nada
    Given existe un vuelo de "Buenos Aires" a "Madrid" con disponibilidad 5
    When compro un pasaje para "Juan Perez" en el vuelo a "Madrid" y en un vuelo inexistente
    Then la venta debe fallar con estado 404
    And la disponibilidad del vuelo a "Madrid" debe ser 5
    And deben existir 0 ventas registradas

  Scenario: No se puede vender dos veces el mismo vuelo en una venta
    Given existe un vuelo de "Buenos Aires" a "Madrid" con disponibilidad 5
    When compro un pasaje para "Juan Perez" dos veces en el vuelo a "Madrid"
    Then la venta debe fallar con estado 400
    And la disponibilidad del vuelo a "Madrid" debe ser 5

  Scenario: Ventas simultaneas no sobrevenden un vuelo
    Given existe un vuelo de "Buenos Aires" a "Madrid" con disponibilidad 1
    And existe un vuelo de "Madrid" a "Buenos Aires" con disponibilidad 10
    When 5 pasajeros compran a la vez los vuelos a "Madrid" y a "Buenos Aires"
    Then exactamente 1 venta debe ser exitosa
    And la disponibilidad del vuelo a "Madrid" debe ser 0
    And la disponibilidad del vuelo a "Buenos Aires" debe ser 9
    And deben existir 1 ventas registradas

  Scenario: Ventas simultaneas con los vuelos en orden inverso no se bloquean entre si
    Given existe un vuelo de "Buenos Aires" a "Madrid" con disponibilidad 10
    And existe un vuelo de "Madrid" a "Buenos Aires" con disponibilidad 10
    When 10 pasajeros compran a la vez los vuelos a "Madrid" y a "Buenos Aires", alternando el orden de los vuelos
    Then todas las ventas deben ser exitosas
    And la disponibilidad del vuelo a "Madrid" debe ser 0
    And la disponibilidad del vuelo a "Buenos Aires" debe ser 0
    And deben existir 10 ventas registradas
