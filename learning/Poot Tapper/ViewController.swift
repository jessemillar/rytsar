//
//  ViewController.swift
//  Poot Tapper
//
//  Created by Jesse Millar on 1/17/16.
//  Copyright © 2016 Jesse Millar. All rights reserved.
//

import UIKit

class ViewController: UIViewController {
    @IBOutlet var scoreLabel: UILabel!
    @IBOutlet var timeLabel: UILabel!
    
    var score = 0
    var seconds = 0
    var timer = NSTimer()
    
    @IBAction func buttonPressed() {
        score++
        scoreLabel.text = "Score \(score)"
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view, typically from a nib.
        setupGame()
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }

    func setupGame() {
        seconds = 30
        score = 0
        
        timeLabel.text = "Time: \(seconds)"
        scoreLabel.text = "Score: \(score)"
        
        timer = NSTimer.scheduledTimerWithTimeInterval(1.0, target: self, selector: Selector("subtractTime"), userInfo: nil, repeats: true)
    }
}

