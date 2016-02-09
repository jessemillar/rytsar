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
import CoreMotion
import AVFoundation

class Enemy: NSObject { // Used to make an array of enemies from the database
    var latitude : Double = 0.0 // Initialize to a "null" double
    var longitude : Double = 0.0
}

class MapViewController: UIViewController, MKMapViewDelegate, CLLocationManagerDelegate {
    @IBOutlet weak var mapView: MKMapView!
 
    var ammo = 6
    var canShoot = true
    var canShootTimer = NSTimer()
    
    var gunFire = AVAudioPlayer()
    var gunReload = AVAudioPlayer()
    
    let locationManager = CLLocationManager()
    let motionManager = CMMotionManager()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        let gunFireFile = NSBundle.mainBundle().URLForResource("fire", withExtension: "mp3")
        do {
            try gunFire = AVAudioPlayer(contentsOfURL: gunFireFile!, fileTypeHint: nil)
        } catch {
            print(error)
        }
        
        let gunReloadFile = NSBundle.mainBundle().URLForResource("reload", withExtension: "mp3")
        do {
            try gunReload = AVAudioPlayer(contentsOfURL: gunReloadFile!, fileTypeHint: nil)
        } catch {
            print(error)
        }
            
        self.locationManager.delegate = self
        self.locationManager.desiredAccuracy = kCLLocationAccuracyBest
        self.locationManager.requestWhenInUseAuthorization() // Only use location services when the app is in use
        self.locationManager.startUpdatingLocation() // Watch the GPS
        self.locationManager.startUpdatingHeading() // Watch the compass
        self.mapView.showsUserLocation = true
        self.mapView.rotateEnabled = true
        
        if motionManager.accelerometerAvailable{
            motionManager.startAccelerometerUpdatesToQueue(NSOperationQueue()) { (data: CMAccelerometerData?, error: NSError?) in
                guard data != nil else {
                    print("There was an error: \(error)")
                    return
                }
                                
                let cone = 0.1

                if abs(data!.acceleration.x) > (0.9 - cone) && abs(data!.acceleration.x) < (0.9 + cone){
//                    print("Ready")
                }
            }
        } else {
            print("Accelerometer is not available")
        }
        
        if motionManager.accelerometerAvailable{
            motionManager.startGyroUpdatesToQueue(NSOperationQueue()) { (data: CMGyroData?, error: NSError?) in
                guard data != nil else {
                    print("There was an error: \(error)")
                    return
                }
                
//                print(data!.rotationRate.y)
                
                if data!.rotationRate.y < -15{
                    self.gunReload.play()
                    print("RELOAD")
                }
                
                if data!.rotationRate.z < -8{
                    self.gunFire.play() // Play a gun firing sound
//                    print("FIRE")
                }
            }
        } else {
            print("Accelerometer is not available")
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
        
//        var zoom = 0.0025
        let zoom = 30.0 // Way zoomed out for testing
        let region = MKCoordinateRegion(center: center, span: MKCoordinateSpan(latitudeDelta: zoom, longitudeDelta: zoom))
        
        self.mapView.setRegion(region, animated: true) // Zoom into the user's current location
        
        // Get data from the API, parse it, and add pins to the map
        let searchRadius = 5
        let userLatitude = location!.coordinate.latitude
        let userLongitude = location!.coordinate.longitude
        var apiURL = "http://woodsman.jessemillar.com:33333/database/"
            apiURL += String(userLatitude) + "/"
            apiURL += String(userLongitude) + "/"
            apiURL += String(searchRadius)
        print(apiURL)
        let url = NSURL(string: apiURL)
        
        let task = NSURLSession.sharedSession().dataTaskWithURL(url!) {(data, response, error) in
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
        
        self.locationManager.stopUpdatingLocation() // Stop updating the location so we can zoom around the map
    }
    
    func locationManager(manager: CLLocationManager, didUpdateHeading newHeading: CLHeading) {
//        print(newHeading.magneticHeading)
    }
    
    func locationManager(manager: CLLocationManager, didFailWithError error: NSError) {
        print("Errors: " + error.localizedDescription)
    }
    
    func setupAudioPlayerWithFile(file:NSString, type:NSString) -> AVAudioPlayer?  {
        //1
        let path = NSBundle.mainBundle().pathForResource(file as String, ofType: type as String)
        let url = NSURL.fileURLWithPath(path!)
        
        //2
        var audioPlayer:AVAudioPlayer?
        
        // 3
        do {
            try audioPlayer = AVAudioPlayer(contentsOfURL: url)
        } catch {
            print("Player not available")
        }
        
        return audioPlayer
    }
}
