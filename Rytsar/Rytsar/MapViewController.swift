//
//  MapViewController.swift
//  Rytsar
//
//  Created by Jesse Millar on 1/24/16.
//  Copyright © 2016 Jesse Millar. All rights reserved.
//

import UIKit
import MapKit
import CoreLocation

class MapViewController: UIViewController, MKMapViewDelegate, CLLocationManagerDelegate {
    @IBOutlet weak var mapView: MKMapView!
    
    let locationManager = CLLocationManager()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        self.locationManager.delegate = self
        self.locationManager.desiredAccuracy = kCLLocationAccuracyBest
        self.locationManager.requestWhenInUseAuthorization() // Only use location services when the app is in use
        self.locationManager.startUpdatingLocation() // Watch the GPS
        self.locationManager.startUpdatingHeading() // Watch the compass
        self.mapView.showsUserLocation = true
        
        // Call to the API to get the global enemies
        guard let rest = RestController.createFromURLString("http://woodsman.jessemillar.com:33333/database") else {
            print("Bad URL")
            return
        }
        
        // Populate the map with global enemies
        rest.get { result in
            do {
                let json = try result.value()
                var i = 1
                while json[i] != nil {
                    let enemy = Enemy(coordinate: CLLocationCoordinate2D(latitude: Double((json[i]?["latitude"]?.stringValue)!)!, longitude: Double((json[i]?["longitude"]?.stringValue)!)!))
                    self.mapView.addAnnotation(enemy)
                    i = i + 1
                }
                
            } catch {
                print("Error performing GET: \(error)")
            }
        }
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    // Location delegate methods
    func locationManager(manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        let location = locations.last
        
        let center = CLLocationCoordinate2D(latitude: location!.coordinate.latitude, longitude: location!.coordinate.longitude)
        
        let region = MKCoordinateRegion(center: center, span: MKCoordinateSpan(latitudeDelta: 0.0025, longitudeDelta: 0.0025))
        
        self.mapView.setRegion(region, animated: true) // Zoom into the user's current location
        
        self.locationManager.stopUpdatingLocation() // Stop updating the location
    }
    
    func locationManager(manager: CLLocationManager, didUpdateHeading newHeading: CLHeading) {
        print(newHeading.magneticHeading)
    }
    
    func locationManager(manager: CLLocationManager, didFailWithError error: NSError) {
        print("Errors: " + error.localizedDescription)
    }
}

