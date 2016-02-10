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
import AudioToolbox

class Enemy: NSObject { // Used to make an array of enemies from the database
    var latitude : Double = 0.0 // Initialize to a "null" double
    var longitude : Double = 0.0
}

class MapViewController: UIViewController, MKMapViewDelegate, CLLocationManagerDelegate {
    @IBOutlet weak var mapView: MKMapView!
 
    var enemies = [Enemy]()
    
    let enemyRadius = 2 // Kilometers
    let shootRadius = 200.0 // In meters
    
    var enemiesLoaded = false

    var userLatitude = 0.0
    var userLongitude = 0.0
    
    var ammo = 6
    var canShoot = true
    var canShootTimer = NSTimer()
    
    var gunFire = AVAudioPlayer()
    var gunReload = AVAudioPlayer()
    
    let locationManager = CLLocationManager()
    let motionManager = CMMotionManager()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
//        AudioServicesPlayAlertSound(SystemSoundID(kSystemSoundID_Vibrate))
        
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
        
        userLatitude = location!.coordinate.latitude
        userLongitude = location!.coordinate.longitude
        
//        let center = CLLocationCoordinate2D(latitude: location!.coordinate.latitude, longitude: location!.coordinate.longitude)
//        
//        let zoom = 0.0035
//        let region = MKCoordinateRegion(center: center, span: MKCoordinateSpan(latitudeDelta: zoom, longitudeDelta: zoom))
//        
//        self.mapView.setRegion(region, animated: true) // Zoom into the user's current location
        
        mapView.setUserTrackingMode(MKUserTrackingMode.FollowWithHeading, animated: true)
        
        if !enemiesLoaded {
            enemiesLoaded = true
            
            // Get data from the API, parse it, and add pins to the map
            let apiURL = "http://woodsman.jessemillar.com:33333/database/" + String(location!.coordinate.latitude) + "/" + String(location!.coordinate.longitude) + "/" + String(enemyRadius)
            print(apiURL)
            let url = NSURL(string: apiURL)
            
            let task = NSURLSession.sharedSession().dataTaskWithURL(url!) {(data, response, error) in
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
                            
                            self.enemies.append(newEnemy)
                        }
                    }
                } catch {
                    print("error serializing JSON: \(error)")
                }
                
                for enemy in self.enemies {
                    let pin = EnemyPin(coordinate: CLLocationCoordinate2D(latitude: enemy.latitude, longitude: enemy.longitude))
                    self.mapView.addAnnotation(pin)
                }
            }
            
            task.resume()
        }
        
//        self.locationManager.stopUpdatingLocation() // Stop updating the location so we can zoom around the map
    }
    
    func locationManager(manager: CLLocationManager, didUpdateHeading newHeading: CLHeading) {
        for enemy in enemies {
            let halfCone = 2.0
            let angle = angleTo(enemy.latitude, lon1: enemy.longitude, lat2: userLatitude, lon2: userLongitude)
            
            if newHeading.magneticHeading > (angle - halfCone) && newHeading.magneticHeading < (angle + halfCone) && withinRange(enemy.latitude, lon1: enemy.longitude, lat2: userLatitude, lon2: userLongitude) {
//                print(angle)
//                print((angle - halfCone), newHeading.magneticHeading, (angle + halfCone), withinRange(enemy.latitude, lon1: enemy.longitude, lat2: userLatitude, lon2: userLongitude))
                AudioServicesPlayAlertSound(SystemSoundID(kSystemSoundID_Vibrate))
                print("Aimed", newHeading.magneticHeading, angle, enemy.latitude, enemy.longitude)
            }
        }
        
//        print(newHeading.magneticHeading)
    }
    
    func locationManager(manager: CLLocationManager, didFailWithError error: NSError) {
        print("Errors: " + error.localizedDescription)
    }
    
    func angleTo(lat1: Float64, lon1: Float64, lat2: Float64, lon2: Float64) -> Float64 {
        let pi = 3.14159
        var angle = atan2(lat2 - lat1, lon2 - lon1) * 180/pi
        
        if (angle < 0){
            angle += 360
        }
        
        return angle + 90;
    }
    
    func withinRange(lat1: Float64, lon1: Float64, lat2: Float64, lon2: Float64) -> Bool {
//        let a = (lat2 - lat1)*(lat2 - lat1)
//        let b = (lon2 - lon1)*(lon2 - lon1)
//        let distance = sqrt(a + b)
        
        let R = 6371000.0 // Radius of the earth in meters
        let x = (lon2-lon1) * cos((lat1+lat2)/2);
        let y = (lat2-lat1);
        let distance = sqrt(x*x + y*y) * R;
        
//        if (distance < 10000){
            print(distance, self.shootRadius)
//        }
        
        if distance < self.shootRadius {
            return true
        } else {
            return false
        }
    }
}
