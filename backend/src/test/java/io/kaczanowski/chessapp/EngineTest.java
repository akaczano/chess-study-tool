package io.kaczanowski.chessapp;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Scanner;


public class EngineTest {

    @Test
    public void startEngine() {
        Runtime runtime = Runtime.getRuntime();
        try {
            Process proc = runtime.exec("engines/stockfish");
            PrintWriter pw = new PrintWriter(proc.getOutputStream());
            pw.println("uci");
            pw.flush();
            Scanner scanner = new Scanner(proc.getInputStream());
            proc.destroy();
            while(scanner.hasNext()) {
                System.out.println(scanner.next());
                System.out.flush();
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

}
