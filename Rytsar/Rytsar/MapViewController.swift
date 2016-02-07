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

class Enemy: NSObject {
    var latitude : Double = 0.0
    var longitude : Double = 0.0
}

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
        
        let url = NSURL(string: "http://woodsman.jessemillar.com:33333/database")
        
        let task = NSURLSession.sharedSession().dataTaskWithURL(url!) {(data, response, error) in
//            print(NSString(data: data!, encoding: NSUTF8StringEncoding))
            
            var enemies = [Enemy]()
            
            do {
                let json = try NSJSONSerialization.JSONObjectWithData(data!, options: .AllowFragments)
                
                if let coordinates = json as? [[String: AnyObject]] {
                    for cursor in coordinates {
                        let newEnemy : Enemy = Enemy()
                        
                        if let latitude = cursor["latitude"] as? String {
                            newEnemy.latitude = Double(latitude)!
                        }
                        
                        if let longitude = cursor["longitude"] as? String {
                            newEnemy.longitude = Double(longitude)!
                        }
                        
                        enemies.append(newEnemy)
                    }
                }
            } catch {
                print("error serializing JSON: \(error)")
            }
            
            for enemy in enemies {
                let pin = EnemyPin(coordinate: CLLocationCoordinate2D(latitude: enemy.latitude, longitude: enemy.longitude))
                self.mapView.addAnnotation(pin)
            }
        }
        
        task.resume()
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    // Location delegate methods
    func locationManager(manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        let location = locations.last
        
        let center = CLLocationCoordinate2D(latitude: location!.coordinate.latitude, longitude: location!.coordinate.longitude)
        
//        var zoom = 0.0025
        let zoom = 15.0
        let region = MKCoordinateRegion(center: center, span: MKCoordinateSpan(latitudeDelta: zoom, longitudeDelta: zoom))
        
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

