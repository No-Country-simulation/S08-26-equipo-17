package com.condotrack.model;

import jakarta.persistence.*;

@Entity
@Table(name = "building")
public class Building {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 200)
    private String address;

    //Getters y Setters
    public Building() {}

    public Building(String name, String address) {
        this.name = name;
        this.address = address;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String nombre) { this.name = nombre; }
    public String getAddress() { return address; }
    public void setDireccion(String direccion) { this.address = direccion; }

}
