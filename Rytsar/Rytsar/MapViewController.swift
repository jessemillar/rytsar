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

struct Globals {
    static var ammo = 6
}

class Enemy: NSObject { // Used to make an array of enemies from the database
    var id : Int = 0 // Initialize to a "null" value that shouldn't ever be a valid ID on the server
    var latitude : Double = 0.0 // Initialize to a "null" double
    var longitude : Double = 0.0
}

class MapViewController: UIViewController, MKMapViewDelegate, CLLocationManagerDelegate {
    @IBOutlet weak var mapView: MKMapView!
 
    var enemies = [Enemy]()
    
    let baseURL = "http://woodsman.jessemillar.com:33333"
    
    let enemyRadius = 1.25 // Kilometers
    let shootRadius = 150.0 // In meters
    
    var enemiesLoaded = false
    var canShoot = true
    let reloadTime = 1.5 // In seconds (needs to be a double)

    var userLatitude = 0.0
    var userLongitude = 0.0
    
    var shootOrientation = true // Make sure we're in gun orientation before allowing a shot
    var enemyAimedAtID = 0
    
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
        
//        if motionManager.accelerometerAvailable{
//            motionManager.startAccelerometerUpdatesToQueue(NSOperationQueue()) { (data: CMAccelerometerData?, error: NSError?) in
//                guard data != nil else {
//                    print("There was an error: \(error)")
//                    return
//                }
//                                
//                let cone = 0.1
//
//                if abs(data!.acceleration.x) > (0.9 - cone) && abs(data!.acceleration.x) < (0.9 + cone){
//                    self.shootOrientation = true
//                } else {
//                    self.shootOrientation = false
//                }
//            }
//        } else {
//            print("Accelerometer is not available")
//        }
        
        if motionManager.accelerometerAvailable{
            motionManager.startGyroUpdatesToQueue(NSOperationQueue()) { (data: CMGyroData?, error: NSError?) in
                guard data != nil else {
                    print("There was an error: \(error)")
                    return
                }
                
//                if data!.rotationRate.y < -15{
//                    self.gunReload.play()
//                    print("RELOAD")
//                }
                
//                print(self.canShoot, self.shootOrientation)
                
                if data!.rotationRate.z < -8{
                    self.shoot()
                }
            }
        } else {
            print("Accelerometer is not available")
        }
    }
    
    func shoot() {
        if (self.canShoot) {
            if Globals.ammo > 1 {
                Globals.ammo--
            } else {
                Globals.ammo = 6
            }
            
            self.canShoot = false
            self.gunFire.play() // Play a gun firing sound
            self.shootEnemy()
            
            let date = NSDate().dateByAddingTimeInterval(self.reloadTime)
            let timer = NSTimer(fireDate: date, interval: 0, target: self, selector: "canShootEnable", userInfo: nil, repeats: false)
            NSRunLoop.mainRunLoop().addTimer(timer, forMode: NSRunLoopCommonModes)
        }
    }
    
    func canShootEnable() {
        self.canShoot = true
        self.gunReload.play()
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
        
        mapView.setUserTrackingMode(MKUserTrackingMode.FollowWithHeading, animated: true)
        
        if !enemiesLoaded {
            enemiesLoaded = true
            
            getEnemies()
        }
    }
    
// MARK: Track compass heading and detect aiming
    func locationManager(manager: CLLocationManager, didUpdateHeading newHeading: CLHeading) {
        for enemy in enemies {
            let distance = distanceTo(userLatitude, lon1: userLongitude, lat2: enemy.latitude, lon2: enemy.longitude)
            let heading = newHeading.magneticHeading
            let angle = angleTo(userLatitude, lon1: userLongitude, lat2: enemy.latitude, lon2: enemy.longitude)
            let halfCone = 8.0 // Make the aiming cone match up with the default compass cone
            var leftCone = angle - halfCone*4 // Not sure why I have to do this to get the cone to the right size...
            var rightCone = angle + halfCone
            
            if leftCone < 0 {
                leftCone += 360
            }
            
            if rightCone > 360 {
                rightCone -= 360
            }
            
            if heading > leftCone && heading < rightCone && distance < shootRadius {
                AudioServicesPlayAlertSound(SystemSoundID(kSystemSoundID_Vibrate))
                enemyAimedAtID = enemy.id
                break
            } else {
                enemyAimedAtID = 0
            }
        }
    }
    
    func locationManager(manager: CLLocationManager, didFailWithError error: NSError) {
        print("Errors: " + error.localizedDescription)
    }
    
    func angleTo(lat1: Float64, lon1: Float64, lat2: Float64, lon2: Float64) -> Float64 {
        var angle = toDegrees(atan2(sin(toRadians(lon2-lon1))*cos(toRadians(lat2)), cos(toRadians(lat1))*sin(toRadians(lat2))-sin(toRadians(lat1))*cos(toRadians(lat2))*cos(toRadians(lon2-lon1))))
        
        if angle < 0 {
            angle = angle + 360
        }
        
        return angle
    }
    
    func distanceTo(lat1: Float64, lon1: Float64, lat2: Float64, lon2: Float64) -> Float64 {
        let φ1 = toRadians(lat1)
        let φ2 = toRadians(lat2)
        let Δλ = toRadians(lon2-lon1)
        let R = 6371000.0 // Gives distance in meters
        let distance = acos(sin(φ1)*sin(φ2) + cos(φ1)*cos(φ2) * cos(Δλ) ) * R;
        
        return distance
    }
    
    func toDegrees(number: Float64) -> Float64 {
        let PI = 3.14159
        
        return number*180/PI
    }
    
    func toRadians(number: Float64) -> Float64 {
        let PI = 3.14159
        
        return number*PI/180
    }
    
    func getEnemies() {
        let latitude = "\(userLatitude)"
        let longitude = "\(userLongitude)"
        let radius = "\(enemyRadius)"
        
        var apiURL = baseURL
            apiURL += "/database/"
            apiURL += latitude + "/"
            apiURL += longitude + "/" + radius
        let url = NSURL(string: apiURL)
        
        let task = NSURLSession.sharedSession().dataTaskWithURL(url!) {(data, response, error) in
            do {
                let json = try NSJSONSerialization.JSONObjectWithData(data!, options: .AllowFragments)
                
                if let coordinates = json as? [[String: AnyObject]] {
                    for cursor in coordinates {
                        let newEnemy : Enemy = Enemy()
                        
                        if let id = cursor["id"] as? String {
                            newEnemy.id = Int(id)!
                        }
                        
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
                print("Error serializing JSON: \(error)")
            }
            
            for enemy in self.enemies {
                let pin = EnemyPin(coordinate: CLLocationCoordinate2D(latitude: enemy.latitude, longitude: enemy.longitude))
                self.mapView.addAnnotation(pin)
            }
        }
        
        task.resume()
    }
    
    func shootEnemy() {
        if enemyAimedAtID > 0 {
            let enemyID = "\(enemyAimedAtID)"
            
            let endpoint: String = baseURL + "/delete/" + enemyID
            let endpointRequest = NSMutableURLRequest(URL: NSURL(string: endpoint)!)
            endpointRequest.HTTPMethod = "DELETE"
            
            let config = NSURLSessionConfiguration.defaultSessionConfiguration()
            let session = NSURLSession(configuration: config)
            
            let task = session.dataTaskWithRequest(endpointRequest, completionHandler: {
                (data, response, error) in
                guard let _ = data else {
                    print("Error shooting enemy")
                    return
                }
                
                dispatch_async(dispatch_get_main_queue(), { // Kill all the enemy pins and repopulate with the updates from the database
                    let allAnnotations = self.mapView.annotations
                    self.mapView.removeAnnotations(allAnnotations)
                    self.enemies.removeAll() // Wipe the local array so we don't get duplicate pins
                    self.getEnemies()
                })
            })
            
            task.resume()
        }
    }
}
